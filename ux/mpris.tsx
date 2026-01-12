import { createBinding, createComputed, createMemo, For } from 'ags';

import Mpris from 'gi://AstalMpris';

import { Config, Static, time } from '../lib/util';
import { Action, Icon, Text, Toggle } from '../lib/widget';

const { PLAYING } = Mpris.PlaybackStatus;

const ICONS = {
    Icon: '\u{f075a}',
    Play: '\u{f040a}',
    Pause: '\u{f03e4}',
    Prev: '\u{f04ae}',
    Next: '\u{f04ad}',
    Paused: '\u{f075b}',
};

const ICON = Static(() => {
    const players = createBinding(Mpris.get_default(), 'players');
    return createMemo(() =>
        players().every(p => createBinding(p, 'playback_status')() !== PLAYING)
            ? ICONS.Paused
            : ICONS.Icon,
    );
});

const player = (p: Mpris.Player) => {
    const pos = createBinding(p, 'position');
    const len = createBinding(p, 'length');
    const val = createComputed(() => (len() > 0 ? pos() / len() : 0));
    return (
        <Action
            actions={[
                [ICONS.Prev, () => p.previous(), createBinding(p, 'can_go_previous')],
                [
                    createBinding(p, 'playback_status').as(s =>
                        s === PLAYING ? ICONS.Pause : ICONS.Play,
                    ),
                    () => p.play_pause(),
                    createBinding(p, 'can_play'),
                ],
                [ICONS.Next, () => p.next(), createBinding(p, 'can_go_next')],
            ]}>
            <Icon from={p} icon="cover_art art_url" valign={Align.START} />
            <Text.Box orientation={Orientation.VERTICAL}>
                <box>
                    <Text class="title" label={createBinding(p, 'title')} hexpand wrap />
                    <image
                        iconName={createBinding(p, 'entry')}
                        pixelSize={Config.Size.Text}
                        tooltipText={createBinding(p, 'identity')}
                    />
                </box>
                <Text class="subtitle" label={createBinding(p, 'artist')} wrap />
                <box visible={len.as(l => l > 0)}>
                    <label label={pos.as(time)} />
                    <slider
                        hexpand
                        onChangeValue={({ value }) => {
                            p.position = value * p.length;
                        }}
                        value={val}
                    />
                    <label label={len.as(time)} />
                </box>
            </Text.Box>
        </Action>
    );
};

const PLAYERS = Static(() =>
    createBinding(Mpris.get_default(), 'players').as(ps =>
        ps.sort((a, b) => a.identity.localeCompare(b.identity)),
    ),
);

export default () => (
    <Toggle
        id="mpris"
        label={ICON()}
        reveal={PLAYERS().as(p => p.length > 0)}
        onSecondary={() => {
            const { players } = Mpris.get_default();
            const playing = players.filter(p => p.playback_status === PLAYING);
            for (const p of playing) {
                p.pause();
            }
            if (playing.length === 0 && players.length === 1) {
                players[0].play();
            }
        }}>
        <box orientation={Orientation.VERTICAL}>
            <For each={PLAYERS()}>{player}</For>
        </box>
    </Toggle>
);
