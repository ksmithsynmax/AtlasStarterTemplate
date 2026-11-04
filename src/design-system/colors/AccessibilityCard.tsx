import { Badge, Card, Stack, Text } from '@mantine/core';
import { atlasPalette, contrastRatio, type AtlasScheme } from '../../theme';
import { contrastSections, type ContrastCheck } from './contrastChecks';
import classes from './AccessibilityCard.module.css';

interface AccessibilityCardProps {
  scheme: AtlasScheme;
}

const formatRatio = (ratio: number) => `${ratio.toFixed(2)}:1`;

function CheckRow({ check, scheme }: { check: ContrastCheck; scheme: AtlasScheme }) {
  const palette = atlasPalette[scheme];
  const fg = check.foreground(palette);
  const bg = check.background(palette);
  const ratio = contrastRatio(fg, bg);
  const passes = ratio >= check.needs;

  return (
    <div className={classes.row}>
      <div>
        <div className={classes.preview} style={{ backgroundColor: bg }}>
          {check.preview === 'text' ? (
            <Text span fz={13} c={fg}>
              Aa
            </Text>
          ) : (
            <span className={classes.mark} style={{ backgroundColor: fg }} />
          )}
        </div>
      </div>
      <Text span fz="inherit">
        {check.check}
      </Text>
      <Text span fz="inherit" c="dimmed">
        {check.usedFor}
      </Text>
      <Text span fz="inherit" className={classes.numeric}>
        {formatRatio(ratio)}
      </Text>
      <Text span fz="inherit" c="dimmed" className={classes.numeric}>
        {check.needs}:1
      </Text>
      <div className={classes.result}>
        <Badge
          variant="light"
          color={passes ? 'success' : 'error'}
          radius="xl"
          h={20}
          px={10}
          fz={12}
          fw={400}
          tt="none"
        >
          {passes ? 'Pass' : 'Fail'}
        </Badge>
      </div>
    </div>
  );
}

/**
 * WCAG contrast checks for the Atlas palette. Ratios are computed from the
 * palette at render time, so they stay correct if the palette changes.
 */
export function AccessibilityCard({ scheme }: AccessibilityCardProps) {
  return (
    <Card>
      <Stack gap={24}>
        {contrastSections.map((section) => (
          <section key={section.title}>
            <Text fz={15} fw={700}>
              {section.title}
            </Text>
            <Text fz={12} c="dimmed" mt={6} mb={16}>
              {section.description}
            </Text>
            <div className={classes.table}>
              <div className={`${classes.row} ${classes.header}`}>
                <span>Preview</span>
                <span>Check</span>
                <span>Used for</span>
                <span className={classes.numeric}>Contrast</span>
                <span className={classes.numeric}>Needs</span>
                <span className={classes.result}>Result</span>
              </div>
              {section.checks.map((check) => (
                <CheckRow key={check.check} check={check} scheme={scheme} />
              ))}
            </div>
          </section>
        ))}
      </Stack>
    </Card>
  );
}
