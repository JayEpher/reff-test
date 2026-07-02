export async function getInitialState(): Promise<{ name: string; avatar?: string }> {
  return {
    name: 'System Admin',
    avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  };
}
