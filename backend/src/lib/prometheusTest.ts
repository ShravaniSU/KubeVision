import { prometheusClient } from './prometheusClient';

async function test() {
  const [cpu, memory, pods] = await Promise.all([
    prometheusClient.nodeCpuUsage(),
    prometheusClient.nodeMemoryUsage(),
    prometheusClient.runningPods(),
  ]);

  console.log('CPU:', cpu);
  console.log('Memory:', memory);
  console.log('Running pods:', pods);
}

test().catch(console.error);