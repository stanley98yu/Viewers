/**
 * @fileoverview Class to interact with Google AI Platform, such as retrieving
 * online predictions to display as labels/annotations over images.
 */

// TODO: We should probably move this.
import getAuthorizationHeader from '../../../../core/src/DICOMWeb/getAuthorizationHeader';

class AiPlatform {
  async getRendered(dicomWebUri) {
    const convertBlobToBase64 = blob =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      });
    const url = new URL(`${dicomWebUri}/rendered`);

    const config = {
      method: 'GET',
      headers: getAuthorizationHeader(),
    };
    config.headers.Accept = 'image/png';
    try {
      const response = await fetch(url, { ...config });
      if (response.status > 200) {
        console.error(response);
        debugger;
        return;
      }
      const blob = await response.blob();
      const base64String = await convertBlobToBase64(blob);
      return base64String.substring(22); // Remove prefix data:image/png;base64,
    } catch (ex) {
      console.error(ex);
      debugger;
    }
  }

  async doMlRequest(dicomWebUri) {
    // TODO: Using a global endpoint currently; replace with dynamic lookup.
    const url = new URL(window.config.onlinePredictionApiEndpoint);
    const base64 = await this.getRendered(dicomWebUri);
    const config = {
      method: 'POST',
      headers: getAuthorizationHeader(),
      body: JSON.stringify({ instances: [{ content: base64 }] }),
    };

    try {
      const response = await fetch(url, { ...config });
      const json = await response.json();
      if (response.status > 200) {
        console.error(json);
        debugger;
        return;
      }
      return json;
    } catch (ex) {
      console.error(ex);
      debugger;
    }
  }
}

export default new AiPlatform();
