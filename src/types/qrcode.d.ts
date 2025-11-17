// types/qrcode.d.ts
declare module "qrcode" {
    interface ToDataURLOptions {
        errorCorrectionLevel?: 'low' | 'medium' | 'quartile' | 'high';
        type?: 'image/png' | 'image/jpeg' | 'image/webp';
        width?: number;
        margin?: number;
        color?: {
            dark?: string;
            light?: string;
        };
    }

    export function toDataURL(
        text: string,
        options?: ToDataURLOptions
    ): Promise<string>;

    const QRCode: {
        toDataURL: typeof toDataURL;
    };

    export default QRCode;
}
