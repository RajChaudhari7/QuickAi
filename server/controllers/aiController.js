import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

// api to generate the article : '/api/ai/generate-article
export const generateArticle = async (req, res) => {
    try {

        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." })
        }

        const response = await AI.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: length,
        });

        const content = response.choices[0].message.content

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId} , ${prompt} , ${content}, 'article')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({ success: true, content })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })

    }
}

// api to generate the blog : '/api/ai/generate-blog-title
export const generateBlogtitle = async (req, res) => {
    try {

        const { userId } = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== "premium" && free_usage >= 10) {
            return res.json({
                success: false,
                message: "Limit reached. Upgrade to continue.",
            });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 200,
        });

        const content = response.choices[0].message.content;

        await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `;

        if (plan !== "premium") {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1,
                },
            });
        }

        res.json({
            success: true,
            content,
        });

    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: error.message,
        });

    }
};

// api to generate the image : '/api/ai/generate-image
export const generateImage = async (req, res) => {
    try {

        const { userId } = req.auth();
        const { prompt, publish } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This featiure is only available for premuim subscriptions" })
        }

        const formData = new FormData()
        formData.append('prompt', prompt)
        const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: { 'x-api-key': process.env.CLIPDROP_API_KEY, },
            responseType: "arraybuffer",
        })

        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

        const { secure_url } = await cloudinary.uploader.upload(base64Image)

        await sql`INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;


        res.json({ success: true, content: secure_url })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })

    }
}

// api to remove the background : '/api/ai/generate-image
export const removeImageBackground = async (req, res) => {
    try {

        const { userId } = req.auth();
        const image = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This featiure is only available for premuim subscriptions" })
        }

        const { secure_url } = await cloudinary.uploader.upload(image.path, {
            transformation: [
                {
                    effect: 'background_removal',
                    background_removal: 'remove_the_background'
                }
            ]
        })

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId} , 'Remove background from image' , ${secure_url}, 'image')`;

        res.json({ success: true, content: secure_url })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })

    }
}



// api to remove the background : '/api/ai/generate-image
export const resumeReview = async (req, res) => {
    try {

        const { userId } = req.auth();
        const resume = req.file;
        const plan = req.plan;

        if (plan !== "premium") {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions"
            });
        }

        if (!resume) {
            return res.json({
                success: false,
                message: "Resume file is required"
            });
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.json({
                success: false,
                message: "Resume file should be less than 5MB"
            });
        }

        const dataBuffer = fs.readFileSync(resume.path);
        const pdfData = await pdf(dataBuffer);

        const prompt = `
Analyze the following resume and return the response ONLY in JSON format.

Required JSON structure:

{
  "score": number (0-100),
  "ats_score": number (0-100),
  "strengths": ["point1","point2"],
  "improvements": ["point1","point2"],
  "missing_keywords": ["keyword1","keyword2"],
  "analysis": "Detailed markdown resume feedback"
}

Resume:
${pdfData.text}
`;

        const response = await AI.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.4,
            max_tokens: 1000,
        });

        let aiText = response.choices[0].message.content;

        // remove markdown formatting if present
        aiText = aiText.replace(/```json|```/g, "").trim();

        const parsed = JSON.parse(aiText);

        await sql`
        INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, 'Review the uploaded resume.', ${JSON.stringify(parsed)}, 'resume-review')
        `;

        res.json({
            success: true,
            content: parsed
        });

    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: error.message
        });

    }
};