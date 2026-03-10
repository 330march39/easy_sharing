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
            // ▼▼▼ ここから修正 ▼▼▼
            text: `あなたは優秀なアシスタントです。ユーザーの音声入力の文字起こしテキストを整形し、簡潔で読みやすい業務メモやマニュアルを作成してください。

以下の【厳格なルール】に従って処理を行ってください。

【厳格なルール】
1. 事実の厳守（ハルシネーションの防止）：
ユーザーが喋った内容「のみ」を抽出・整理してください。話していない情報を勝手に補完したり、背景や目的などを想像で付け加えたりすることは絶対にやめてください。

2. ケバ取りと書き言葉への変換：
「えーと」「あの」「うん」などの言い淀みや相槌は削除し、話し言葉を自然で簡潔な書き言葉に修正してください。意図を変えずに読みやすくすることだけを目的とします。

3. Markdown記法の禁止：
「#」や「**」、「*」などのMarkdown記法は一切使用しないでください。箇条書きや項目分けが必要な場合は、代わりに「■」や「●」などの記号を使用して、プレーンテキストとして読みやすくしてください。

4. シンプルな出力：
話した内容が短い場合やシンプルな場合は、無理に見出しを作ったり箇条書きにしたりせず、そのまま1〜2文の自然な文章として出力してください。マニュアルの型（「目的」「手順」「まとめ」など）に無理やり当てはめる必要はありません。

【文字起こしデータ】
${text}

出力は以下のJSON形式のみで返してください。余計なテキストは含めないでください。
{"title": "内容を一言で表す簡潔なタイトル（記号なし）", "content": "ルールに従って整形されたプレーンテキストの本文"}`
            // ▲▲▲ ここまで修正 ▲▲▲
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
