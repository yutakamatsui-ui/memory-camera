import { useState } from 'react';

const CONDITIONS = [
  { label: '☀️ もし快晴だったら', prompt: 'Change the weather to bright sunny clear sky, keep everything else the same' },
  { label: '❄️ もし大雪だったら', prompt: 'Change the weather to heavy snowfall and snow covered ground, keep everything else the same' },
  { label: '🌸 もし春だったら', prompt: 'Change the season to spring with cherry blossoms, keep everything else the same' },
  { label: '🍂 もし秋だったら', prompt: 'Change the season to autumn with red and orange leaves, keep everything else the same' },
  { label: '🌙 もし夜だったら', prompt: 'Change the time to night with city lights and stars, keep everything else the same' },
  { label: '🕰️ もし50年前だったら', prompt: 'Change the scene to look like 50 years ago, vintage style, keep the composition the same' },
];

export default function Home() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target.result);
      setImageBase64(ev.target.result);
      setResult(null);
      setSelected(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!imageBase64 || selected === null) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, ifCondition: CONDITIONS[selected].prompt }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
    } catch (err) {
      setError('生成に失敗しました。もう一度お試しください。');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>📸 記憶改ざんカメラ</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>写真をアップロードして、if の世界線を見る</p>

      <input type="file" accept="image/*" onChange={handleUpload} style={{ marginBottom: 16 }} />

      {image && (
        <img src={image} alt="アップロード画像" style={{ width: '100%', borderRadius: 12, marginBottom: 16 }} />
      )}

      {image && (
        <>
          <p style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>もし… どうだったら？</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {CONDITIONS.map((c, i) => (
              <button key={i} onClick={() => setSelected(i)} style={{
                padding: '10px 8px', borderRadius: 10, border: selected === i ? '2px solid #7F77DD' : '1px solid #ddd',
                background: selected === i ? '#EEEDFE' : '#fff', cursor: 'pointer', fontSize: 13, textAlign: 'left'
              }}>
                {c.label}
              </button>
            ))}
          </div>

          <button onClick={handleGenerate} disabled={selected === null || loading} style={{
            width: '100%', padding: 14, borderRadius: 12, border: 'none',
            background: selected === null ? '#ccc' : '#7F77DD', color: '#fff',
            fontSize: 15, fontWeight: 'bold', cursor: selected === null ? 'not-allowed' : 'pointer'
          }}>
            {loading ? '世界線を書き換え中…' : '世界線を書き換える'}
          </button>
        </>
      )}

      {error && <p style={{ color: 'red', marginTop: 16 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>✨ if の世界線</p>
          <img src={result} alt="生成結果" style={{ width: '100%', borderRadius: 12 }} />
        </div>
      )}
    </div>
  );
}
