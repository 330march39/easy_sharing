export default async function handler(req, res) {
  // POSTメソッド以外は弾く
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  // Vercelの環境変数からAPIキーを取得
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'APIキーが設定されていません。' });
  }

  try {
    // Gemini 2.5 Flashモデルを使用（高速で安価）
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `以下の音声の文字起こしテキストから、誰が見ても同じ仕事ができるような、わかりやすいステップバイステップの指示書（マニュアル）を作成してください。雑談などは省き、要点を整理してください。\n\n【文字起こしデータ】\n${text}\n\n出力は以下のJSON形式のみで返してください。余計なテキストは含めないでください。\n{"title": "マニュアルのタイトル", "content": "マークダウン形式の詳しい手順"}`
          }]
        }]
      })
    });

    const data = await response.json();
    
    // Geminiからの返答を取得してJSONにパース
    const resultText = data.candidates[0].content.parts[0].text;
    const jsonStr = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(jsonStr);

    res.status(200).json(result);
  } catch (error) {
    console.error('Gemini API Error:', error);
    // エラー時は500を返し、フロントエンドでフォールバックさせる
    res.status(500).json({ error: 'マニュアルの生成に失敗しました。' });
  }
}
