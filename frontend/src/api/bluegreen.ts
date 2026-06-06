import api from './client';

export interface BlueGreenStatus {
  activeRelease: any;
  previewRelease: any;
  releases: any[];
}

export const blueGreenApi = {
  getStatus: (deploymentId: string): Promise<BlueGreenStatus> =>
    api.get(`/bluegreen/${deploymentId}/status`).then((r) => r.data),
  deploy: (data: { deploymentId: string; version: string; image: string }): Promise<any> =>
    api.post('/bluegreen/deploy', data).then((r) => r.data),
  switch: (data: { releaseId: string }): Promise<any> =>
    api.post('/bluegreen/switch', data).then((r) => r.data),
  rollback: (data: { releaseId: string }): Promise<any> =>
    api.post('/bluegreen/rollback', data).then((r) => r.data),
};
