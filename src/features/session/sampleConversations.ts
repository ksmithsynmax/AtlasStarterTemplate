import type { ChatMessageData } from '../../components/chat';

/** Sample threads keyed by session id, until real conversations exist. */
export const sampleConversations: Record<string, ChatMessageData[]> = {
  s1: [
    {
      id: 's1-1',
      role: 'user',
      text: 'Show me all activity and detections in the Strait of Hormuz',
      time: '09:28 PM',
    },
    {
      id: 's1-2',
      role: 'assistant',
      time: '09:29 PM',
      text: `I've built a dashboard of all activity and detections in the Strait of Hormuz for the past week (26 Oct – 2 Nov 2026, UTC). I used the box 25.5–27.0°N, 55.6–57.3°E, which covers the strait from about Dubai/Sharjah east to Musandam and Bandar Abbas. It has six headline numbers, a map, a daily bar chart and full tables of every detection and AIS dark event.

**Satellite detections: 4,318** (3,173 from PlanetScope, 781 from Sentinel-1 radar, 364 from Sentinel-2)

- **Matched to a known vessel:** 917. That includes **153 detections of vessels that had AIS switched off** when the image was taken.
- **Not matched to any vessel:** 3,401. Most of these are small craft under 80 m, which are too small to classify by type.
- **By type:** 428 cargo ships, 414 tankers, 23 tugs, 5 military vessels, 5 passenger ships and 3,443 unclassified.
- **Possible ship-to-ship transfers:** 27 detections were flagged, mostly tankers (10 on 26 Oct and 6 on 2 Nov).

**AIS dark events: 977** (times a vessel's AIS transponder went silent inside the box)

- 763 have ended. The median time dark was about 7.9 hours, and 41 lasted more than 48 hours, which is the high-risk threshold.`,
    },
    {
      id: 's1-3',
      role: 'user',
      text: 'So is the Edit Map settings and the Chart settings tailored per dashboard or do they have the same settings every time?',
      time: '09:41 PM',
    },
    {
      id: 's1-4',
      role: 'assistant',
      time: '09:42 PM',
      text: 'The map and chart settings are the same everywhere, but the options shown depend on the layer or chart type. The Hormuz map uses icon layers (arrow, warning, STS), so it already has icon options. I can add per-type colours and a time slider as next steps.',
    },
  ],
};

/** Opening exchange for sessions without a sample thread. */
export function fallbackConversation(title: string): ChatMessageData[] {
  return [
    { id: 'fallback-1', role: 'user', text: title, time: '09:12 AM' },
    {
      id: 'fallback-2',
      role: 'assistant',
      time: '09:13 AM',
      text: `Here's a first pass on **${title}**. I pulled the most recent data available and summarised the key trends. Ask a follow-up to dig into a region, a time range or a specific operator.`,
    },
  ];
}
