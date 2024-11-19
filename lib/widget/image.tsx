import { Binding } from 'astal';
import { Widget } from 'astal/gtk3';

import { join } from '../sub';

function build(image: string, css?: string) {
    return `background-image: url('${image}'); ${css || ''}`;
}

export interface Props extends Widget.BoxProps {
    image: string | Binding<string>;
}
export default ({ image, css, ...rest }: Props) => {
    if (image instanceof Binding) {
        if (css instanceof Binding) {
            return <box {...rest} css={join(image, css).as(build)} />;
        }
        return <box {...rest} css={image.as(i => build(i, css))} />;
    }
    if (css instanceof Binding) {
        return <box {...rest} css={css.as(c => build(image, c))} />;
    }
    return <box {...rest} css={build(image, css)} />;
};
