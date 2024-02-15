export type RequestWs = {
    type: string,
    data: {
        name: string,
        index: number,
        error: boolean,
        errorText: string
    },
    id: number
}