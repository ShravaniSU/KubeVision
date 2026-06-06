"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));
const pastDate = (hoursAgo) => new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
const clusters = [
    { name: 'Production Cluster', environment: 'production', region: 'us-east-1', status: 'healthy' },
    { name: 'Staging Cluster', environment: 'staging', region: 'us-west-2', status: 'healthy' },
    { name: 'Development Cluster', environment: 'development', region: 'eu-west-1', status: 'degraded' }
];
const nodeStatusOptions = ['healthy', 'healthy', 'healthy', 'warning', 'degraded'];
const deploymentNames = ['inventory-service', 'auth-service', 'payment-service', 'notification-service'];
const podStatuses = ['Running', 'Running', 'Running', 'Pending', 'CrashLoopBackOff'];
const logMessages = [
    'Service started successfully.',
    'Database connection established.',
    'Health check passed.',
    'High memory usage detected.',
    'Request processed successfully.',
    'Connection timed out.',
    'Rolling update initiated.',
    'Configuration loaded from environment.',
    'Cache miss detected.',
    'Autoscaling event triggered.'
];
const logLevels = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR'];
const releaseStatuses = ['succeeded', 'succeeded', 'rolled-back', 'succeeded', 'active'];
const releaseColors = ['blue', 'green', 'blue', 'green', 'blue'];
async function main() {
    for (const clusterConfig of clusters) {
        const cluster = await prisma.cluster.create({ data: clusterConfig });
        const nodes = [];
        for (let i = 1; i <= 5; i++) {
            nodes.push(await prisma.node.create({
                data: {
                    name: `node-${clusterConfig.environment}-${String(i).padStart(2, '0')}`,
                    clusterId: cluster.id,
                    cpuUsage: randomFloat(20, 90),
                    memoryUsage: randomFloat(30, 85),
                    diskUsage: randomFloat(10, 70),
                    status: nodeStatusOptions[randomInt(0, nodeStatusOptions.length - 1)]
                }
            }));
        }
        const deployments = [];
        for (let i = 0; i < deploymentNames.length; i++) {
            const name = deploymentNames[i];
            deployments.push(await prisma.deployment.create({
                data: {
                    name,
                    clusterId: cluster.id,
                    image: `docker.io/kubevision/${name}`,
                    version: `v1.${i}.0`,
                    replicas: randomInt(2, 5),
                    availableReplicas: randomInt(1, 5),
                    status: i === 3 && clusterConfig.environment === 'development' ? 'pending' : 'running'
                }
            }));
        }
        for (const deployment of deployments) {
            const releaseDates = [30, 20, 14, 7, 1];
            const podNodeIds = nodes.map((node) => node.id);
            const podCount = 3;
            for (let podIndex = 1; podIndex <= podCount; podIndex++) {
                const nodeId = podNodeIds[randomInt(0, podNodeIds.length - 1)];
                const pod = await prisma.pod.create({
                    data: {
                        name: `${deployment.name}-pod-${podIndex}`,
                        deploymentId: deployment.id,
                        nodeId,
                        status: podStatuses[randomInt(0, podStatuses.length - 1)],
                        startedAt: pastDate(randomInt(1, 48))
                    }
                });
                for (let logIndex = 0; logIndex < 40; logIndex++) {
                    await prisma.log.create({
                        data: {
                            podId: pod.id,
                            level: logLevels[randomInt(0, logLevels.length - 1)],
                            message: logMessages[randomInt(0, logMessages.length - 1)],
                            timestamp: pastDate(randomInt(1, 48))
                        }
                    });
                }
            }
            for (let releaseIndex = 0; releaseIndex < 5; releaseIndex++) {
                await prisma.release.create({
                    data: {
                        deploymentId: deployment.id,
                        version: `v1.${releaseIndex}.${releaseIndex}`,
                        color: releaseColors[releaseIndex],
                        status: releaseStatuses[releaseIndex],
                        notes: releaseIndex === 2
                            ? 'Rollback due to memory spike and restart loop.'
                            : 'Deployment completed successfully.',
                        deployedAt: new Date(Date.now() - releaseDates[releaseIndex] * 24 * 60 * 60 * 1000)
                    }
                });
            }
        }
        for (let snapshot = 0; snapshot < 48; snapshot++) {
            await prisma.metricSnapshot.create({
                data: {
                    clusterId: cluster.id,
                    cpuUsage: randomFloat(40, 85),
                    memoryUsage: randomFloat(40, 85),
                    podCount: randomInt(50, 70),
                    failedPods: randomInt(0, 3),
                    capturedAt: new Date(Date.now() - (47 - snapshot) * 30 * 60 * 1000)
                }
            });
        }
    }
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
const prisma = new client_1.PrismaClient();
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const sample = (items) => items[Math.floor(Math.random() * items.length)];
const clusterSeed = [
    {
        name: 'Production Cluster',
        environment: 'production',
        region: 'us-east-1',
        status: 'healthy',
    },
    {
        name: 'Staging Cluster',
        environment: 'staging',
        region: 'us-west-2',
        status: 'healthy',
    },
    {
        name: 'Development Cluster',
        environment: 'development',
        region: 'eu-west-1',
        status: 'degraded',
    },
];
const deploymentNames = ['inventory-service', 'auth-service', 'payment-service', 'notification-service'];
const podStatusOptions = ['Running', 'Pending', 'CrashLoopBackOff'];
const logMessages = [
    'Service started successfully',
    'Database connection established',
    'Health check passed',
    'High memory usage detected',
    'Connection timeout warning',
    'Request processed successfully',
    'Cache refreshed',
    'Deployment rollout completed',
    'Pod restarted automatically',
    'Configuration loaded',
];
const releaseStatuses = ['succeeded', 'succeeded', 'rolled-back', 'succeeded', 'active'];
const releaseColors = ['blue', 'green'];
async function main() {
    const clusters = [];
    for (const clusterData of clusterSeed) {
        const cluster = await prisma.cluster.create({ data: clusterData });
        clusters.push({ id: cluster.id, name: cluster.name, environment: cluster.environment });
        const nodes = [];
        for (let i = 1; i <= 5; i += 1) {
            const node = await prisma.node.create({
                data: {
                    name: `node-${cluster.environment}-${i}`,
                    clusterId: cluster.id,
                    cpuUsage: randomInt(20, 90),
                    memoryUsage: randomInt(30, 85),
                    diskUsage: randomInt(10, 70),
                    status: i > 4 ? 'warning' : 'healthy',
                },
            });
            nodes.push({ id: node.id, name: node.name });
        }
        for (const deploymentName of deploymentNames) {
            const replicas = randomInt(2, 5);
            const deployment = await prisma.deployment.create({
                data: {
                    name: deploymentName,
                    clusterId: cluster.id,
                    image: `docker.io/kubevision/${deploymentName}`,
                    version: `v1.${randomInt(0, 3)}.0`,
                    replicas,
                    availableReplicas: replicas - randomInt(0, 1),
                    status: sample(['running', 'pending', 'running']),
                },
            });
            const assignedNodes = [...nodes].sort(() => Math.random() - 0.5).slice(0, 3);
            for (let podIndex = 1; podIndex <= 3; podIndex += 1) {
                const pod = await prisma.pod.create({
                    data: {
                        name: `${deploymentName}-pod-${podIndex}`,
                        deploymentId: deployment.id,
                        nodeId: assignedNodes[(podIndex - 1) % assignedNodes.length].id,
                        status: sample(podStatusOptions),
                        startedAt: new Date(Date.now() - randomInt(10, 360) * 60000),
                    },
                });
                const now = Date.now();
                for (let logIndex = 0; logIndex < 40; logIndex += 1) {
                    const timestamp = new Date(now - randomInt(0, 48 * 60) * 60000);
                    const level = Math.random() < 0.15 ? 'ERROR' : Math.random() < 0.25 ? 'WARN' : 'INFO';
                    await prisma.log.create({
                        data: {
                            podId: pod.id,
                            level,
                            message: sample(logMessages),
                            timestamp,
                        },
                    });
                }
            }
            for (let releaseIndex = 0; releaseIndex < 5; releaseIndex += 1) {
                await prisma.release.create({
                    data: {
                        deploymentId: deployment.id,
                        version: `v1.${releaseIndex}.${releaseIndex === 4 ? 0 : 0}`,
                        color: releaseColors[releaseIndex % 2],
                        status: releaseStatuses[releaseIndex],
                        notes: releaseIndex === 2 ? 'Rollback due to instability' : 'Release completed without issues',
                        deployedAt: new Date(Date.now() - (30 - releaseIndex * 6) * 24 * 60 * 60000),
                    },
                });
            }
        }
        for (let snapshotIndex = 0; snapshotIndex < 48; snapshotIndex += 1) {
            const minutesAgo = (47 - snapshotIndex) * 30;
            await prisma.metricSnapshot.create({
                data: {
                    clusterId: cluster.id,
                    cpuUsage: randomInt(40, 85),
                    memoryUsage: randomInt(40, 85),
                    podCount: randomInt(50, 70),
                    failedPods: randomInt(0, 3),
                    capturedAt: new Date(Date.now() - minutesAgo * 60000),
                },
            });
        }
    }
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
