import { RunTimeLayoutConfig } from '@umijs/max';

export async function getInitialState(): Promise<{ name: string }> {
  return { name: 'Admin System 3' };
}

export const layout: RunTimeLayoutConfig = () => {
  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
  };
};
