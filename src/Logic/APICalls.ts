const axios = require('axios');

let currentBatch;

export function generator() {
  const ran1 = () =>
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].sort((x, z) => {
      const ren = Math.random();
      if (ren === 0.5) return 0;
      return ren > 0.5 ? 1 : -1;
    });
  const ran2 = () =>
    ran1().sort((x, z) => {
      const ren = Math.random();
      if (ren === 0.5) return 0;
      return ren > 0.5 ? 1 : -1;
    });

  return Array(6)
    .fill(null)
    .map((x) => ran2()[(Math.random() * 9).toFixed()])
    .join('');
}

export const sendClip = async () => {
  try {
    currentBatch = generator();
    const json = { clipboard: clipboard.readText(), batch: currentBatch };
    console.log('Data', json);
    await axios
      .put('http://192.168.1.191:5000/Clip', json, {
        headers: {
          // Authorization: 'Basic xxxxxxxxxxxxxxxxxxx',
          'Content-Type': 'application/json; charset=utf-8',
        },
      })
      .then((res) => {
        return null;
        // Manage incoming response. If loading, then spinning wheel and loading screen. If success then success screen and timed out dismiss. If failure, then capture errors!
      });
  } catch (error) {
    console.log(error);
  }
};

export const getClip = async () => {
  try {
    const response = await axios.get('http://192.168.1.191:5000/Clip/GetClip');
    currentBatch = response.data.batch;
    clipboard.writeText(response.data.clipboard);
    console.log('Clipboard: ', response.data.clipboard);
  } catch (error) {
    console.log(error);
  }
};

export const getBatch = async () => {
  try {
    const response = await axios.get('http://192.168.1.191:5000/Clip/GetBatch');
    console.log('cBatch: ', currentBatch, ' nBatch: ', response.data);
    if (!response.data || !(response.data === currentBatch)) {
      await getClip();
    }
  } catch (error) {
    console.log(error);
  }
};
