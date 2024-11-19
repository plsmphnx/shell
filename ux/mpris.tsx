import { bind } from 'astal';
import { Astal, Widget } from 'astal/gtk3';
import Mpris from 'gi://AstalMpris';

import { join, reduce } from '../lib/sub';
import { Monitor } from '../lib/util';
import { Action, Image, Toggle } from '../lib/widget';

const { PLAYING } = Mpris.PlaybackStatus;

const ICONS = {
    Icon: '\u{f075a}',
    Play: '\u{f040a}',
    Pause: '\u{f03e4}',
    Prev: '\u{f04ae}',
    Next: '\u{f04ad}',
    Paused: '\u{f075b}',
};

const FALLBACK_ICON = 'audio-x-generic-symbolic';

function length(s: number) {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${`0${sec}`.slice(-2)}`;
}

const players = bind(Mpris.get_default(), 'players');

const icon = bind(
    reduce(
        players.as(ps =>
            bind(join(...ps.map(p => bind(p, 'playback_status')))).as(ss =>
                ss.every(s => s !== PLAYING),
            ),
        ),
    ),
).as(p => (p ? ICONS.Paused : ICONS.Icon));

const Text = (props: Widget.LabelProps) => <label {...props} hexpand wrap halign={START} />;

const player = (p: Mpris.Player) => {
    const pos = bind(p, 'position');
    const len = bind(p, 'length');
    return (
        <Action
            actions={[
                [ICONS.Prev, () => p.previous(), bind(p, 'can_go_previous')],
                [
                    bind(p, 'playback_status').as(s =>
                        s === PLAYING ? ICONS.Pause : ICONS.Play,
                    ),
                    () => p.play_pause(),
                    bind(p, 'can_play'),
                ],
                [ICONS.Next, () => p.next(), bind(p, 'can_go_next')],
            ]}>
            <box>
                <Image className="icon" valign={START} image={bind(p, 'cover_art')} />
                <box vertical>
                    <box>
                        <Text className="title" label={bind(p, 'title')} />
                        <icon
                            icon={bind(p, 'entry').as(e =>
                                Astal.Icon.lookup_icon(e) ? e : FALLBACK_ICON,
                            )}
                            tooltipText={bind(p, 'identity')}
                            valign={START}
                        />
                    </box>
                    <Text className="subtitle" label={bind(p, 'artist')} />
                    <box visible={len.as(l => l > 0)}>
                        <label label={pos.as(length)} />
                        <slider
                            hexpand
                            onDragged={({ value }) => (p.position = value * p.length)}
                            value={join(pos, len).as((p, l) => (l > 0 ? p / l : 0))}
                        />
                        <label label={len.as(length)} />
                    </box>
                </box>
            </box>
        </Action>
    );
};

export default ({ monitor }: Monitor.Props) => (
    <Toggle
        monitor={monitor}
        label={icon}
        reveal={players.as(p => p.length > 0)}
        onSecondary={() => {
            const ps = players.get();
            const playing = ps.filter(p => p.playback_status === PLAYING);
            for (const p of playing) {
                p.pause();
            }
            if (playing.length === 0 && ps.length === 1) {
                ps[0].play();
            }
        }}>
        <box vertical>{players.as(p => p.map(player))}</box>
    </Toggle>
);
