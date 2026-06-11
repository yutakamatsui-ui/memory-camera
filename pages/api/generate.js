export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { imageBase64, ifCondition } = req.body;

  try {
    const base64Data = imageBase64.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: 'image/png' });

    const form = new FormData();
    form.append('image', blob, 'image.png');
    form.append('prompt', ifCondition);
    form.append('n', '1');
    form.append('size', '512x512');

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
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
