export interface Drawing {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  element: any;
  style?: string;
  color?: string;
}

export interface VisualizationStep {
  explanation: string;
  graphicDrawingsStepList: Drawing[];
}
