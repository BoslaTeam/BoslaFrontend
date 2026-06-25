import { HttpParams } from '@angular/common/http';

type HttpParamValue =
    | string
    | number
    | boolean
    | null
    | undefined;

export function buildHttpParams<T extends object>(
    params: T,
): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
        if (
            value !== null &&
            value !== undefined &&
            value !== ''
        ) {
            httpParams = httpParams.set(
                key,
                String(value as HttpParamValue),
            );
        }
    });

    return httpParams;
}