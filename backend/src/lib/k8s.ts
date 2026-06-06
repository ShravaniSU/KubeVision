import * as k8s from '@kubernetes/client-node';

const kc = new k8s.KubeConfig();
kc.loadFromDefault(); // reads ~/.kube/config automatically

export const coreApi    = kc.makeApiClient(k8s.CoreV1Api);       // pods, nodes, namespaces, logs
export const appsApi    = kc.makeApiClient(k8s.AppsV1Api);       // deployments
export const metricsApi = new k8s.Metrics(kc);                   // CPU/memory via metrics-server

export const TARGET_NAMESPACE = 'kubevision-apps';