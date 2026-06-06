-- CreateTable
CREATE TABLE "Cluster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "cpuUsage" DOUBLE PRECISION NOT NULL,
    "memoryUsage" DOUBLE PRECISION NOT NULL,
    "diskUsage" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deployment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "replicas" INTEGER NOT NULL,
    "availableReplicas" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deploymentId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "restartedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "podId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Release" (
    "id" TEXT NOT NULL,
    "deploymentId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "deployedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricSnapshot" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "cpuUsage" DOUBLE PRECISION NOT NULL,
    "memoryUsage" DOUBLE PRECISION NOT NULL,
    "podCount" INTEGER NOT NULL,
    "failedPods" INTEGER NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Node_name_key" ON "Node"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Pod_name_key" ON "Pod"("name");

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pod" ADD CONSTRAINT "Pod_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pod" ADD CONSTRAINT "Pod_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_podId_fkey" FOREIGN KEY ("podId") REFERENCES "Pod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricSnapshot" ADD CONSTRAINT "MetricSnapshot_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
