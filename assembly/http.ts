import { register, hostCall, handleAbort } from "wapc-guest-as";
import { Decoder, Encoder, Sizer, Value } from "as-msgpack";

// Abort function
function abort(
  message: string | null,
  fileName: string | null,
  lineNumber: u32,
  columnNumber: u32
): void {
  handleAbort(message, fileName, lineNumber, columnNumber);
}

//// Scalars

//// Enumerations

//// Args

export class Host {
  binding: string;

  constructor(binding: string) {
    this.binding = binding;
  }

  handleRequest(person: Request): Response {
    const payload = hostCall(
      this.binding,
      "wascc:HttpClient",
      "HandleRequest",
      person.toBuffer()
    );

    const decoder = new Decoder(payload);
    return Response.decode(decoder);
  }
}

export class Handlers {
  static handleRequest(handler: (person: Request) => Response): void {
    handleRequestHandler = handler;
    register("HandleRequest", handleRequestWrapper);
  }
}

//// Interface

var handleRequestHandler: (person: Request) => Response;
function handleRequestWrapper(payload: ArrayBuffer): ArrayBuffer {
  const decoder = new Decoder(payload);

  const request = new Request();
  request.decode(decoder);
  const response = handleRequestHandler(request);

  return response.toBuffer();
}

//// Types

// Represents an HTTP response that the guest module would like to return in response to a request command
export class Request {
  // The HTTP method.
  method: string;

  // The path.
  path: string;

  // The raw query string.
  queryString: string;

  // The HTTP request headers.
  header: Map<string, string> | null;

  // Happiness
  body: ArrayBuffer;

  constructor() {
    this.method = "";
    this.path = "";
    this.queryString = "";
    this.body = new ArrayBuffer(0);
  }

  static decodeNullable(decoder: Decoder): Request | null {
    if (decoder.isNextNil()) return null;
    return Request.decode(decoder);
  }

  static decode(decoder: Decoder): Request {
    const o = new Request();
    o.decode(decoder);
    return o;
  }

  decode(decoder: Decoder): void {
    var numFields = decoder.readMapSize();

    while (numFields > 0) {
      numFields--;
      const field = decoder.readString();
      if (field == "method") {
        this.method = decoder.readString();
      } else if (field == "path") {
        this.path = decoder.readString();
      } else if (field == "queryString") {
        this.queryString = decoder.readString();
      } else if (field == "header") {
        if (decoder.isNextNil()) {
          this.header = null;
        } else {
          const mapSize = decoder.readMapSize();
          this.header = new Map<string, string>();
          for (let i: u32 = 0; i < mapSize; i++) {
            const key = decoder.readString();
            const value = decoder.readString();
            this.header.set(key, value);
          }
        }
      } else if (field == "body") {
        this.body = decoder.readByteArray();
      } else {
        decoder.skip();
      }
    }
  }

  size(sizer: Sizer): void {
    sizer.writeMapSize(5);
    sizer.writeString("method");
    sizer.writeString(this.method);
    sizer.writeString("path");
    sizer.writeString(this.path);
    sizer.writeString("queryString");
    sizer.writeString(this.queryString);
    sizer.writeString("header");
    if (this.header === null) {
      sizer.writeNil();
    } else {
      const headerMap = this.header!;
      sizer.writeMapSize(headerMap.size);
      const headerKeys = headerMap.keys();
      for (let i: i32 = 0; i < headerKeys.length; i++) {
        const key = headerKeys[i];
        const value = headerMap.get(key);
        sizer.writeString(key);
        sizer.writeString(value);
      }
    }
    sizer.writeString("body");
    sizer.writeByteArray(this.body);
  }

  encode(encoder: Encoder): void {
    encoder.writeMapSize(5);
    encoder.writeString("method");
    encoder.writeString(this.method);
    encoder.writeString("path");
    encoder.writeString(this.path);
    encoder.writeString("queryString");
    encoder.writeString(this.queryString);
    encoder.writeString("header");
    if (this.header === null) {
      encoder.writeNil();
    } else {
      const headerMap = this.header!;
      encoder.writeMapSize(headerMap.size);
      const headerKeys = headerMap.keys();
      for (let i: i32 = 0; i < headerKeys.length; i++) {
        const key = headerKeys[i];
        const value = headerMap.get(key);
        encoder.writeString(key);
        encoder.writeString(value);
      }
    }
    encoder.writeString("body");
    encoder.writeByteArray(this.body);
  }

  toBuffer(): ArrayBuffer {
    let sizer = new Sizer();
    this.size(sizer);
    let buffer = new ArrayBuffer(sizer.length);
    let encoder = new Encoder(buffer);
    this.encode(encoder);
    return buffer;
  }
}

export class RequestBuilder {
  instance: Request;

  constructor() {
    this.instance = new Request();
  }

  withMethod(method: string): RequestBuilder {
    this.instance.method = method;
    return this;
  }

  withPath(path: string): RequestBuilder {
    this.instance.path = path;
    return this;
  }

  withQueryString(querystring: string): RequestBuilder {
    this.instance.queryString = querystring;
    return this;
  }

  withHeader(header: Map<string, string> | null): RequestBuilder {
    this.instance.header = header;
    return this;
  }

  withBody(body: ArrayBuffer): RequestBuilder {
    this.instance.body = body;
    return this;
  }

  build(): Request {
    return this.instance;
  }
}

// Represents an HTTP response that the guest module would like to return in response to a request command.
export class Response {
  // The HTTP status code.
  statusCode: u32;

  // The HTTP status name.
  status: string;

  // The HTTP request headers.
  header: Map<string, string> | null;

  // Happiness
  body: ArrayBuffer;

  constructor() {
    this.statusCode = 0;
    this.status = "";
    this.body = new ArrayBuffer(0);
  }

  static decodeNullable(decoder: Decoder): Response | null {
    if (decoder.isNextNil()) return null;
    return Response.decode(decoder);
  }

  static decode(decoder: Decoder): Response {
    const o = new Response();
    o.decode(decoder);
    return o;
  }

  decode(decoder: Decoder): void {
    var numFields = decoder.readMapSize();

    while (numFields > 0) {
      numFields--;
      const field = decoder.readString();
      if (field == "statusCode") {
        this.statusCode = decoder.readUInt32();
      } else if (field == "status") {
        this.status = decoder.readString();
      } else if (field == "header") {
        if (decoder.isNextNil()) {
          this.header = null;
        } else {
          const mapSize = decoder.readMapSize();
          this.header = new Map<string, string>();
          for (let i: u32 = 0; i < mapSize; i++) {
            const key = decoder.readString();
            const value = decoder.readString();
            this.header.set(key, value);
          }
        }
      } else if (field == "body") {
        this.body = decoder.readByteArray();
      } else {
        decoder.skip();
      }
    }
  }

  size(sizer: Sizer): void {
    sizer.writeMapSize(4);
    sizer.writeString("statusCode");
    sizer.writeUInt32(this.statusCode);
    sizer.writeString("status");
    sizer.writeString(this.status);
    sizer.writeString("header");
    if (this.header === null) {
      sizer.writeNil();
    } else {
      const headerMap = this.header!;
      sizer.writeMapSize(headerMap.size);
      const headerKeys = headerMap.keys();
      for (let i: i32 = 0; i < headerKeys.length; i++) {
        const key = headerKeys[i];
        const value = headerMap.get(key);
        sizer.writeString(key);
        sizer.writeString(value);
      }
    }
    sizer.writeString("body");
    sizer.writeByteArray(this.body);
  }

  encode(encoder: Encoder): void {
    encoder.writeMapSize(4);
    encoder.writeString("statusCode");
    encoder.writeUInt32(this.statusCode);
    encoder.writeString("status");
    encoder.writeString(this.status);
    encoder.writeString("header");
    if (this.header === null) {
      encoder.writeNil();
    } else {
      const headerMap = this.header!;
      encoder.writeMapSize(headerMap.size);
      const headerKeys = headerMap.keys();
      for (let i: i32 = 0; i < headerKeys.length; i++) {
        const key = headerKeys[i];
        const value = headerMap.get(key);
        encoder.writeString(key);
        encoder.writeString(value);
      }
    }
    encoder.writeString("body");
    encoder.writeByteArray(this.body);
  }

  toBuffer(): ArrayBuffer {
    let sizer = new Sizer();
    this.size(sizer);
    let buffer = new ArrayBuffer(sizer.length);
    let encoder = new Encoder(buffer);
    this.encode(encoder);
    return buffer;
  }
}

export class ResponseBuilder {
  instance: Response;

  constructor() {
    this.instance = new Response();
  }

  withStatusCode(statuscode: u32): ResponseBuilder {
    this.instance.statusCode = statuscode;
    return this;
  }

  withStatus(status: string): ResponseBuilder {
    this.instance.status = status;
    return this;
  }

  withHeader(header: Map<string, string> | null): ResponseBuilder {
    this.instance.header = header;
    return this;
  }

  withBody(body: ArrayBuffer): ResponseBuilder {
    this.instance.body = body;
    return this;
  }

  build(): Response {
    return this.instance;
  }
}
