import { Gdk } from 'ags/gtk4';

import { Monitor } from '../lib/util';

import Bar from './bar';
import Launcher from './launcher';

export default (gdk: Gdk.Monitor) => (
    <Monitor.Context value={{ gdk }}>
        {() => {
            <Launcher />;
            return <Bar />;
        }}
    </Monitor.Context>
);
