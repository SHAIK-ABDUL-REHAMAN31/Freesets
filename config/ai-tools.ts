// IDs match the AITool enum values in types/prompt.types.ts

export const AI_TOOLS = [
    {
        id: 'MIDJOURNEY',
        name: 'Midjourney',
        iconPath: '/icons/midjourney.svg',
        website: 'https://midjourney.com',
        description: 'Industry-leading AI image generator known for painterly, high-quality aesthetics.',
        isVideoTool: false,
    },
    {
        id: 'DALLE',
        name: 'DALL-E 3',
        iconPath: '/icons/dalle.svg',
        website: 'https://openai.com/dall-e-3',
        description: "OpenAI's flagship image model with tight prompt-following and rich detail.",
        isVideoTool: false,
    },
    {
        id: 'STABLE_DIFFUSION',
        name: 'Stable Diffusion',
        iconPath: '/icons/stable-diffusion.svg',
        website: 'https://stability.ai',
        description: 'Open-source image generation model with massive community and fine-tune ecosystem.',
        isVideoTool: false,
    },
    {
        id: 'SORA',
        name: 'Sora',
        iconPath: '/icons/sora.svg',
        website: 'https://openai.com/sora',
        description: "OpenAI's text-to-video model capable of generating cinematic, minute-long clips.",
        isVideoTool: true,
    },
    {
        id: 'RUNWAY',
        name: 'Runway',
        iconPath: '/icons/runway.svg',
        website: 'https://runwayml.com',
        description: 'Professional AI video generation and editing suite used in film and advertising.',
        isVideoTool: true,
    },
    {
        id: 'KLING',
        name: 'Kling AI',
        iconPath: '/icons/kling.svg',
        website: 'https://kling.kuaishou.com',
        description: 'High-fidelity video generation model by Kuaishou with realistic motion physics.',
        isVideoTool: true,
    },
    {
        id: 'GEMINI',
        name: 'Gemini',
        iconPath: '/icons/gemini.svg',
        website: 'https://gemini.google.com',
        description: "Google's multimodal AI supporting image understanding and generation via Imagen.",
        isVideoTool: false,
    },
    {
        id: 'FIREFLY',
        name: 'Adobe Firefly',
        iconPath: '/icons/firefly.svg',
        website: 'https://adobe.com/firefly',
        description: "Adobe's commercially-safe generative AI trained on licensed, rights-cleared content.",
        isVideoTool: false,
    },
] as const;

export type AIToolId = typeof AI_TOOLS[number]['id'];
