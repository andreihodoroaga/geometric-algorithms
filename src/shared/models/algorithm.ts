export interface Drawing {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  element?: any;
  style?: string;
  color?: string;
  size?: number;
}

export interface VisualizationStep {
  explanation?: string;
  explanations?: string[];
  graphicDrawingsStepList?: Drawing[];
}
