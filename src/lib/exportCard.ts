import { formatDate, number, type LifetimeStats } from './stats';

type CardOptions = { birthday: string; stats: LifetimeStats; trophyCount: number; isExample: boolean };

export async function createPersonalCard({ birthday, stats, trophyCount, isExample }: CardOptions): Promise<Blob> {
    await document.fonts.ready;
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser could not create your image.');
    const css = getComputedStyle(document.documentElement);
    const color = (token: string) => css.getPropertyValue(token).trim();
    const paper = color('--paper'), ink = color('--ink'), blue = color('--blue'), garnet = color('--garnet');

    function text(content: string, x: number, y: number, size: number, fill = ink, family = 'DM Sans Variable', weight = '400') {
        context!.fillStyle = fill;
        context!.font = `${weight} ${size}px "${family}"`;
        context!.fillText(content, x, y);
    }
    function line(x1: number, y1: number, x2: number, y2: number) {
        context!.strokeStyle = '#cdd1c6'; context!.lineWidth = 1;
        context!.beginPath(); context!.moveTo(x1, y1); context!.lineTo(x2, y2); context!.stroke();
    }

    context.fillStyle = paper; context.fillRect(0, 0, 1080, 1350);
    context.fillStyle = blue; context.fillRect(0, 0, 540, 9);
    context.fillStyle = garnet; context.fillRect(540, 0, 540, 9);
    text('culé.', 76, 131, 103, ink, 'Instrument Serif');
    context.fillStyle = blue; context.fillRect(81, 144, 62, 5);
    context.fillStyle = garnet; context.fillRect(143, 144, 62, 5);
    text('THE BARCELONA', 755, 103, 16, ink, undefined, '500');
    text('NUMBERS PROJECT', 755, 128, 16, ink, undefined, '500');
    text(isExample ? 'A CULER’S LIFE.' : 'MY LIFE.', 75, 302, isExample ? 83 : 108, ink, 'Barcelona 26/27', '600');
    text('In blaugrana.', 72, 439, 142, blue, 'Barcelona 26/27');
    text(`${isExample ? 'EXAMPLE · ' : ''}BORN ${formatDate(birthday).toUpperCase()}`, 80, 489, 19, ink, undefined, '500');
    line(80, 540, 1000, 540); line(80, 785, 1000, 785); line(80, 1030, 1000, 1030); line(530, 540, 530, 1030);
    const cells = [
        { x: 80, y: 587, label: 'MATCHES LIVED', value: stats.matches.length, fill: ink },
        { x: 573, y: 587, label: 'GOALS CELEBRATED', value: stats.goalsFor, fill: ink },
        { x: 80, y: 831, label: 'TIMES WE WON', value: stats.wins, fill: blue },
        { x: 573, y: 831, label: 'MAJOR TROPHIES', value: trophyCount, fill: garnet },
    ];
    for (const cell of cells) {
        text(cell.label, cell.x, cell.y, 16, ink, undefined, '500');
        text(number(cell.value), cell.x - 5, cell.y + 139, 109, cell.fill, 'Barcelona 26/27', '500');
    }
    let offset = 80;
    const total = stats.matches.length || 1;
    for (const [count, fill] of [[stats.wins, blue], [stats.draws, '#a2a799'], [stats.losses, garnet]] as const) {
        const width = count / total * 920;
        context.fillStyle = fill; context.fillRect(offset, 1091, Math.max(0, width - 3), 12); offset += width;
    }
    text(`${stats.winRate.toFixed(1)}% WIN RATE`, 80, 1070, 16, ink, undefined, '500');
    text('Made of numbers. Built on a feeling.', 78, 1205, 47, ink, 'Instrument Serif', '400');
    text('MEN’S FIRST TEAM · LALIGA, SEP 1993–MAY 2025', 80, 1263, 13, '#586254');
    text('MAJOR HONOURS: LALIGA, CHAMPIONS LEAGUE & COPA DEL REY · 1993–MAY 2025', 80, 1286, 11, '#586254');
    text('INDEPENDENT FAN PROJECT · MATCH DATA: FOOTBALL-DATA.CO.UK', 80, 1308, 11, '#586254');

    return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The image could not be created. Please try again.')), 'image/png'));
}
