import { bind } from 'astal';
import Wp from 'gi://AstalWp';

import { select } from '../lib/icons';
import { join, reduce } from '../lib/sub';
import { Context, Select } from '../lib/util';
import { Status } from '../lib/widget';

const ICONS = {
    Speaker: {
        Off: '\u{f0e08}',
        On: select('\u{f057f}', '\u{f0580}', '\u{f057e}'),
    },

    Microphone: {
        Off: '\u{f036d}',
        On: select('\u{f036c}'),
    },
};

function icon(
    audio: Wp.Audio,
    icons: { Off: string; On: (volume: number) => string },
    device: keyof Select<Wp.Audio, Wp.Endpoint>,
) {
    const dev = bind(audio, device);
    return join(
        reduce(dev.as(d => bind(d, 'mute'))),
        reduce(dev.as(d => bind(d, 'volume'))),
    ).as((mute, volume) => (mute || volume === 0 ? icons.Off : icons.On(volume)));
}

const SPEAKER = Context(() => icon(Wp.get_default()!.audio, ICONS.Speaker, 'default_speaker'));

const MICROPHONE = Context(() =>
    icon(Wp.get_default()!.audio, ICONS.Microphone, 'default_microphone'),
);

export const Speaker = ({ ctx }: Context.Props) => (
    <Status label={SPEAKER(ctx)} onPrimary="pwvucontrol" />
);

export const Microphone = ({ ctx }: Context.Props) => (
    <Status
        label={MICROPHONE(ctx)}
        onPrimary="pwvucontrol"
        reveal={bind(Wp.get_default()!.audio, 'recorders').as(r => r.length > 0)}
    />
);
