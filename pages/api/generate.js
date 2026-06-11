export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { imageBase64, ifCondition } = req.body;

  try {
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: (() => {
        const form = new FormData();
        const buffer = Buffer.from(imageBase64.split(',')[1], 'base64');
        const blob = new Blob([buffer], { type: 'image/png' });
        form.append('image', blob, 'image.png');
        form.append('prompt', ifCondition);
        form.append('n', '1');
        form.append('size', '512x512');
        return form;
      })(),
    });

    const data = await response.json();
    res.status(200).json({ result: data.data[0].url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '生成に失敗しました' });
  }
}
