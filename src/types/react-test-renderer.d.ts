declare module 'react-test-renderer' {
    export interface ReactTestRendererJSON {
        type: string;
        props: { [propName: string]: any };
        children: null | ReactTestRendererNode[];
    }
    export type ReactTestRendererNode = ReactTestRendererJSON | string;
    export interface ReactTestRenderer {
        toJSON(): ReactTestRendererJSON | null;
        toTree(): ReactTestRendererJSON | null;
        update(nextElement: React.ReactElement): void;
        unmount(): void;
        getInstance(): any | null;
        root: any;
    }
    export interface TestRendererOptions {
        createNodeMock?: (element: React.ReactElement) => any;
    }
    export function create(
        nextElement: React.ReactElement,
        options?: TestRendererOptions
    ): ReactTestRenderer;
    export function act(callback: () => void | Promise<void>): Promise<void>;

    const renderer: {
        create: typeof create;
        act: typeof act;
    };
    export default renderer;
}
