import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const database = require('@/lib/database');

// Helper function to upload image to S3
async function uploadToS3(imageBuffer: Buffer, contentType: string = 'image/png') {
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
  const crypto = require('crypto');
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
  const fileName = `social-genie/${crypto.randomBytes(16).toString('hex')}.png`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: imageBuffer,
    ContentType: contentType
  });

  await s3Client.send(command);
  const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
  return s3Url;
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Check generation limits
    const userPlan = await database.getUserPlan(userId);
    const monthlyCount = await database.getMonthlyGenerationCount(userId);
    
    const limits: Record<string, number> = {
      standard: 0,
      pro: 30,
      premium: 60
    };
    
    const userLimit = limits[userPlan] || 60;
    
    if (monthlyCount >= userLimit) {
      return NextResponse.json({ 
        error: 'Generation limit reached', 
        message: `You have reached your monthly limit of ${userLimit} AI generations. Please upgrade your plan or wait until next month.`,
        plan: userPlan,
        used: monthlyCount,
        limit: userLimit
      }, { status: 403 });
    }

    const body = await req.json();
    const { prompt, caption_length } = body;
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const maxWords = caption_length || 30;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey || openaiKey === 'your_openai_api_key_here') {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables' 
      }, { status: 500 });
    }

    // Check S3 configuration
    if (!process.env.S3_BUCKET_NAME || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json({ 
        error: 'S3 is not configured. Please add AWS credentials to environment variables' 
      }, { status: 500 });
    }

    // Generate image with DALL-E 3
    console.log('Generating image with DALL-E 3...');
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      })
    });

    const imageData = await imageResponse.json();
    
    if (!imageResponse.ok || !imageData.data || !imageData.data[0].url) {
      console.error('DALL-E error:', imageData);
      return NextResponse.json({ 
        error: 'Failed to generate image', 
        details: imageData.error?.message || 'Unknown error' 
      }, { status: 500 });
    }

    const imageUrl = imageData.data[0].url;
    const revisedPrompt = imageData.data[0].revised_prompt || prompt;

    // Generate caption with GPT
    console.log('Generating caption with GPT...');
    const captionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a social media caption writer. Create an engaging caption in exactly ${maxWords} words or less. Include 3-5 relevant hashtags at the end. Make it catchy and engaging.`
          },
          {
            role: 'user',
            content: `Create a social media caption for this image: ${revisedPrompt}`
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    const captionData = await captionResponse.json();
    
    if (!captionResponse.ok || !captionData.choices || !captionData.choices[0]) {
      console.error('GPT error:', captionData);
      return NextResponse.json({ 
        error: 'Failed to generate caption', 
        details: captionData.error?.message || 'Unknown error' 
      }, { status: 500 });
    }

    const caption = captionData.choices[0].message.content.trim();

    // Download image from OpenAI URL
    console.log('Downloading image from OpenAI...');
    const downloadResponse = await fetch(imageUrl);
    if (!downloadResponse.ok) {
      return NextResponse.json({ 
        error: 'Failed to download generated image' 
      }, { status: 500 });
    }
    
    const imageBuffer = Buffer.from(await downloadResponse.arrayBuffer());

    // Upload to S3
    console.log('Uploading to S3...');
    const s3Url = await uploadToS3(imageBuffer, 'image/png');

    // Save to database
    const post = await database.savePost(userId, {
      content: caption,
      media_url: s3Url,
      prompt: prompt,
      status: 'draft',
      platforms: []
    });

    // Increment generation count
    await database.incrementGenerationCount(userId);

    return NextResponse.json({
      success: true,
      caption: caption,
      imageUrl: s3Url,
      postId: post.id,
      revisedPrompt: revisedPrompt,
      generationsUsed: monthlyCount + 1,
      generationsLimit: userLimit
    });

  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
