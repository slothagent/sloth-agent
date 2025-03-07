import ora, { type Ora } from 'ora';

interface SpinnerMap {
  [key: string]: Ora;
}

const spinners: SpinnerMap = {};

export const logger = {
  info: (message: string) => console.log(`ℹ️ ${message}`),
  error: (context: string, error: unknown) => {
    console.error(`❌ ${context}:`, error);
  }
};

export function startSpinner(key: string, text: string) {
  if (spinners[key]) {
    spinners[key].text = text;
    spinners[key].start();
  } else {
    spinners[key] = ora(text).start();
  }
}

export function succeedSpinner(key: string, text?: string) {
  if (spinners[key]) {
    spinners[key].succeed(text);
    delete spinners[key];
  }
}

export function failSpinner(key: string, text?: string) {
  if (spinners[key]) {
    spinners[key].fail(text);
    delete spinners[key];
  }
}

export function cleanup() {
  Object.keys(spinners).forEach((key) => {
    spinners[key].stop();
    delete spinners[key];
  });
} 