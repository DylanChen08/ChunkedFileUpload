declare module 'spark-md5' {
  export default class SparkMD5 {
    constructor();
    append(data: ArrayBuffer | string): void;
    end(): string;
    destroy(): void;
    
    static ArrayBuffer: typeof SparkMD5;
  }
}
