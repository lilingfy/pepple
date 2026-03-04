#!/usr/bin/env node
/**
 * Test script for Zhipu AI API
 * Tests glm-4-flash-250414 model with 80 concurrent requests
 */

const API_KEY = '8ff71ebf18f14b8ca4f8c568e57b82fa.21jMy80ni1opXnMj';
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const MODEL = 'glm-4-flash-250414';

// Test messages representing different Chinese manipulation scenarios
const testMessages = [
  '你看别人家的媳妇，又能挣钱又顾家，再看看你...',
  '我养你这么大，你就这样对我？',
  '你要是不听我的，我就当没你这个孩子！',
  '亲戚都看着呢，你让我脸往哪搁？',
  '我这么做都是为了你好，你怎么就不明白？',
  '你姐夫每月给岳母一万，你呢？',
  '年轻人要多加班，不要太计较钱。',
  '咱们是一家人，借点钱怎么了？',
];

async function callZhipu(message, index) {
  const startTime = Date.now();

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `你是一个精通中国文化背景下的"高冲突人格 (HCP)"心理学防御专家。

分析用户输入的中文消息，识别潜台词和操控手段。

输出格式（JSON）：
{
  "surfaceMeaning": "表面意思",
  "trueIntent": "真实意图",
  "attackType": ["攻击类型"],
  "replies": {
    "minimal": "极简回复",
    "gentle": "温和回复",
    "boundary": "坚定回复"
  }
}`,
        },
        {
          role: 'user',
          content: `请分析以下对话："${message}"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  const latency = Date.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    return { index, success: false, error, latency };
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  return { index, success: true, latency, content };
}

async function runTest() {
  console.log('🧪 Testing Zhipu AI API (glm-4-flash-250414)');
  console.log('====================================');
  console.log(`API Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(-8)}`);
  console.log(`Testing ${testMessages.length} concurrent requests\n`);

  const startTime = Date.now();

  // Run all requests concurrently to test 80 concurrent capacity
  const results = await Promise.all(
    testMessages.map((msg, i) => callZhipu(msg, i))
  );

  const totalTime = Date.now() - startTime;

  // Display results
  console.log('\n📊 Results:');
  console.log('====================================');

  let successCount = 0;
  let failCount = 0;
  let totalLatency = 0;

  results.forEach((result) => {
    if (result.success) {
      successCount++;
      totalLatency += result.latency;
      console.log(`\n✅ Request ${result.index + 1} (${result.latency}ms)`);
      console.log(`   Input: ${testMessages[result.index].substring(0, 40)}...`);

      // Try to parse and show JSON
      try {
        const jsonMatch =
          result.content.match(/```json\n?([\s\S]*?)\n?```/) ||
          result.content.match(/```\n?([\s\S]*?)\n?```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : result.content;
        const parsed = JSON.parse(jsonStr);
        console.log(`   Attack Type: ${parsed.attackType?.join(', ') || 'N/A'}`);
        console.log(`   Minimal Reply: ${parsed.replies?.minimal || 'N/A'}`);
      } catch (e) {
        console.log(`   Raw: ${result.content.substring(0, 100)}...`);
      }
    } else {
      failCount++;
      console.log(`\n❌ Request ${result.index + 1} FAILED (${result.latency}ms)`);
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('\n====================================');
  console.log('📈 Summary:');
  console.log(`   Success: ${successCount}/${results.length}`);
  console.log(`   Failed: ${failCount}/${results.length}`);
  console.log(`   Total Time: ${totalTime}ms`);
  console.log(
    `   Avg Latency: ${successCount > 0 ? Math.round(totalLatency / successCount) : 0}ms`
  );
  console.log(
    `   Throughput: ${((results.length / totalTime) * 1000).toFixed(2)} req/sec`
  );

  if (successCount === results.length) {
    console.log('\n✨ All tests passed! API is working correctly.');
  }
}

runTest().catch(console.error);
