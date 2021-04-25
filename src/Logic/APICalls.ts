import { clipboard } from 'electron';

const axios = require('axios');

let currentBatch: number;

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

// const randomInt = (min: number, max: number): number => {
//   // return Math.floor(Math.random() * (max - min + 1) + min);
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// };

export const sendClip = async () => {
  try {
    const randomInt = generator();
    const json = { clipboard: clipboard.readText(), batch: randomInt };
    console.log('Sending', json);
    await axios
      .put('http://192.168.1.53:5000/Clip', json, {
        headers: {
          // Authorization: 'Basic xxxxxxxxxxxxxxxxxxx',
          'Content-Type': 'application/json; charset=utf-8',
        },
      })
      .then((res: any) => {
        currentBatch = Number(randomInt);
        return null;
        // Manage incoming response. If loading, then spinning wheel and loading screen. If success then success screen and timed out dismiss. If failure, then capture errors!
      });
  } catch (error) {
    console.log(error.response.data);
  }
};

export const getClip = async () => {
  try {
    const response = await axios.get('http://192.168.1.53:5000/Clip/GetClip');
    clipboard.writeText(response.data.clipboard);
    // const newBatch: number = +response.data.batch;
    currentBatch = Number(response.data.batch);
    if (typeof currentBatch === 'number') {
      console.log('getBatch: Number');
    } else {
      console.log('getBatch: Not number');
    }
    console.log('getClip: ', response.data.clipboard);
  } catch (error) {
    console.log(error.response.data);
  }
};

export const getBatch = async () => {
  try {
    const response = await axios.get('http://192.168.1.53:5000/Clip/GetBatch');
    // console.log('cBatch: ', currentBatch, ' nBatch: ', response.data);
    if (!(currentBatch === response.data)) {
      await getClip();
    }
    // if (typeof response.data === 'number') {
    //   console.log('getBatch: Number');
    // } else {
    //   console.log('getBatch: Not number');
    // }

    // if (typeof currentBatch === 'number') {
    //   console.log('Current: Number');
    // } else {
    //   console.log('Current: Not number');
    // }
  } catch (error) {
    console.log(error.response.data);
  }
};
