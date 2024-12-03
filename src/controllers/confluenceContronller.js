const HttpRequestBuilder = require('./HttpRequestBuilder');

class Confluences {
  static user;
  static tokens;

  static URL_CONFLUENCE = "https://confluence-ath.atlassian.net/";
  static URL_JIRA = "https://jira-ath.atlassian.net/";

  static async getValidateUser(username, token) {
    this.user = username;
    this.tokens = token;

    const response = await new HttpRequestBuilder(this.URL_CONFLUENCE + "wiki/api/v2/spaces")
        .get()
        .auth(this.user, this.tokens)
        .send();

    // Verifica si la respuesta fue exitosa (suponiendo que el código de estado es 200 para éxito)
    if (response.statusCode === 200) {
        return true;  // Usuario válido
    } else {
        return false;  // Usuario no válido
    }
}

  static async getSpaces(username, token) {
    this.user = username;
    this.tokens = token;

    const response = await new HttpRequestBuilder(this.URL_CONFLUENCE + "wiki/api/v2/spaces")
      .get()
      .auth(this.user, this.tokens)
      .send();

    return response.body;
  }

  static async getSpaces() {
    const response = await new HttpRequestBuilder(this.URL_CONFLUENCE + "wiki/api/v2/spaces")
      .get()
      .auth(this.user, this.tokens)
      .send();

    return response.body;
  }

  static async getPagesForSpace(idSpace) {
    try {
      const response = await new HttpRequestBuilder(this.URL_CONFLUENCE + "wiki/api/v2/spaces/" + idSpace + "/pages")
        .get()
        .auth(this.user, this.tokens)
        .send();

      const responseBody = response.body;
      const jsonObject = JSON.parse(responseBody);
      const resultsArray = jsonObject.results;

      for (let i = 0; i < resultsArray.length; i++) {
        const page = resultsArray[i];
        if (page.parentType === null) {
          return page.id;
        }
      }
    } catch (e) {
      console.error(e);
    }

    return null;
  }

  static async getPagesForParent(parent) {
    const response = await new HttpRequestBuilder(this.URL_CONFLUENCE + "wiki/api/v2/pages/" + parent + "/children?limit=200")
      .get()
      .auth(this.user, this.tokens)
      .send();
    const responseBody = response.body;
    const jsonObject = JSON.parse(responseBody);
    return jsonObject.results;
  }

  static async validateExistUserHistory(issue) {
    const response = await new HttpRequestBuilder(this.URL_JIRA + "rest/api/3/issue/" + issue)
      .get()
      .auth(this.user, this.tokens)
      .send();

    const responseBody = response.body;
    const jsonObject = JSON.parse(responseBody);

    if (response.statusCode === 200) {
      return String(response.statusCode);
    } else {
      const resultsArray = jsonObject.errorMessages;
      return resultsArray[0];
    }
  }

  static async validateExistPage(titlePage, parent) {
    const response = await new HttpRequestBuilder(this.URL_CONFLUENCE + "wiki/api/v2/pages/" + parent + "/children?limit=200")
      .get()
      .auth(this.user, this.tokens)
      .send();

    const responseBody = response.body;
    const jsonObject = JSON.parse(responseBody);
    const resultsArray = jsonObject.results;

    for (let i = 0; i < resultsArray.length; i++) {
      const page = resultsArray[i];
      if (page.title === titlePage) {
        return page.id;
      }
    }

    return null;
  }

  static async createStructureFolderConfluence(space, name, parent) {
    const bodyRequest = {
        "spaceId": space,
        "status": "current",
        "title": name,
        "parentId": parent,
        "body": {
            "representation": "storage",
            "value": ""
        }
    };

    try {
        // Verifica si el objeto HttpRequestBuilder se está construyendo correctamente
        const request = new HttpRequestBuilder(this.URL_CONFLUENCE + "wiki/api/v2/pages")
            .post()
            .auth(this.user, this.tokens);

        // Enviar la solicitud
        const response = await request.sendWithBody(bodyRequest);

        // Verifica el estado de la respuesta
        if (response.statusCode === 200) {
            const responseBody = JSON.parse(response.body);
            return responseBody.id;
        } else {
            console.error("Error: Response Code " + response.statusCode);
        }
    } catch (e) {
        console.error('Error during request:', e);
    }

    return null;
}

  static async createPages(spaceId, title, subPageId) {
    let responseRQ = await this.createStructureFolderConfluence(spaceId, title, subPageId);
    if (!responseRQ) {
      responseRQ = await this.validateExistPage(title, subPageId);
    }

    await this.createStructureFolderConfluence(spaceId, title + " Anexos", responseRQ);
    await this.createStructureFolderConfluence(spaceId, title + " Planeacion", responseRQ);
    await this.createStructureFolderConfluence(spaceId, title + " Certificacion", responseRQ);

    let responseEjecicion = await this.createStructureFolderConfluence(spaceId, title + " Ejecucion", responseRQ);
    if (!responseEjecicion) {
      responseEjecicion = await this.validateExistPage(title + " Ejecucion", responseRQ);
    }

    await this.createStructureFolderConfluence(spaceId, title + " Adjuntos", responseEjecicion);
    await this.createStructureFolderConfluence(spaceId, title + " Ciclo 1", responseEjecicion);

    let responseProduccion = await this.createStructureFolderConfluence(spaceId, title + " Paso a produccion", responseRQ);
    if (!responseProduccion) {
      responseProduccion = await this.validateExistPage(title + " Paso a produccion", responseRQ);
    }

    await this.createStructureFolderConfluence(spaceId, title + " Correos posproduccion", responseProduccion);
  }
}

module.exports = Confluences;
