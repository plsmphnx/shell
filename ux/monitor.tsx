import { Gdk } from 'ags/gtk4';

import { Monitor } from '../lib/util';
import { Closer } from '../lib/widget';

import Bar from './bar';
import Launcher from './launcher';
import Share from './share';

export default (gdk: Gdk.Monitor) => (
    <Monitor.Context value={{ gdk }}>
        {() => {
            <Closer />;
            <Launcher />;
            <Share />;
            return <Bar />;
        }}
    </Monitor.Context>
);
