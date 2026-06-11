import sharp from 'sharp';

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { imageBase64, ifCondition } = req.body;

  try {
    const base64Data = imageBase64.split(',')[1];
    const inputBuffer = Buffer.from(base64Data, 'base64');

    const pngBuffer = await sharp(inputBuffer)
      .resize(512, 512, { fit: 'cover' })
      .png()
      .toBuffer();

    const { default: FormData } = await import('form-data');
    const form = new FormData();
    form.append('image', pngBuffer, { filename: 'image.png', contentType: 'image/png' });
    form.append('prompt', ifCondition);
    form.append('n', '1');
    form.append('size', '512x512');

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    res.status(200).json({ result: data.data[0].url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
