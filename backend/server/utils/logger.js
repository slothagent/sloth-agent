import ora from 'ora';



const spinners = {};

export const logger = {
  info: (message) => console.log(`ℹ️ ${message}`),
  error: (context, error) => {
    console.error(`❌ ${context}:`, error);
  }
};

export function startSpinner(key, text) {
  if (spinners[key]) {
    spinners[key].text = text;
    spinners[key].start();
  } else {
    spinners[key] = ora(text).start();
  }
}

export function succeedSpinner(key, text) {
  if (spinners[key]) {
    spinners[key].succeed(text);
    delete spinners[key];
  }
}

export function failSpinner(key, text) {
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