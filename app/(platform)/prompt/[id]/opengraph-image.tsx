import { ImageResponse } from 'next/og';

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

export const runtime = 'edge';
export const alt = 'Freesets Prompt';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// ─────────────────────────────────────────────────────────────────────────────
// Image Generator
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default async function Image({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Fetch the prompt
    let title = 'AI Prompt';
    let outputImageUrl = '';

    try {
        const res = await fetch(`${BASE_URL}/api/prompts/${id}`);
        if (res.ok) {
            const json = await res.json();
            if (json.data) {
                title = json.data.title;
                outputImageUrl = json.data.outputImageUrl;
            }
        }
    } catch {
        // use defaults
    }

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    position: 'relative',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* ── Background: prompt output image ────────────────────────────── */}
                {outputImageUrl ? (
                    <img
                        src={outputImageUrl}
                        alt=""
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                ) : (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
                        }}
                    />
                )}

                {/* ── Dark overlay for text readability ──────────────────────────── */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)',
                        display: 'flex',
                    }}
                />

                {/* ── Content ────────────────────────────────────────────────────── */}
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '48px 56px',
                    }}
                >
                    {/* Top: Freesets logo / wordmark */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        {/* Purple circle brand mark */}
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 22,
                                    fontWeight: 800,
                                    color: 'white',
                                    letterSpacing: '-1px',
                                }}
                            >
                                F
                            </span>
                        </div>
                        <span
                            style={{
                                fontSize: 28,
                                fontWeight: 700,
                                color: 'white',
                                letterSpacing: '-0.5px',
                            }}
                        >
                            Freesets
                        </span>
                    </div>

                    {/* Bottom: Prompt title */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                        }}
                    >
                        <span
                            style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: 'rgba(139,92,246,0.9)',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                            }}
                        >
                            AI Prompt
                        </span>
                        <span
                            style={{
                                fontSize: 48,
                                fontWeight: 800,
                                color: 'white',
                                lineHeight: 1.15,
                                letterSpacing: '-1px',
                                maxWidth: '900px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                            }}
                        >
                            {title}
                        </span>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        },
    );
}
