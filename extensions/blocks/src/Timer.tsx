import '@shopify/ui-extensions/preact';
import { Fragment, render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

export default async () => {
  render(<Extension />, document.body);
};

type TypeSettings = {
  date: string | null;
  active_text: string | null
  expired_text: string | null
};

type TimeMarkerProps = {
  timeValue: number;
  label: string;
};

const TIME_MARKER_KEYS = [
  'time_marker_day',
  'time_marker_hour',
  'time_marker_minute',
  'time_marker_second',
];

const getTimeLeft = (endDate: number): number => {
  const diff = endDate - Date.now();
  return Math.max(Math.floor(diff / 1000), 0);
};

const normalizedTimeMarker = (timeMarker = 0, symbol: string): string => {
  return `${String(timeMarker).padStart(2, '0')}${symbol}`;
};

function Extension() {
  const translate = shopify.i18n.translate;
  const settings = shopify.settings.value as TypeSettings;

  const endDate = settings.date ? new Date(settings.date).getTime() : 0;
  const activeText = settings.active_text
  const expiredText = settings.expired_text

  const [time, setTime] = useState<number>(() => getTimeLeft(endDate));

  useEffect(() => {
    if (!endDate) return;

    const intervalId = setInterval(() => {
      setTime(getTimeLeft(endDate));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [endDate]);

  const days = Math.floor(time / 86400);
  const hours = Math.floor((time % 86400) / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  const dateValues = [days, hours, minutes, seconds];

  if (time === 0 && expiredText) {
    return (
      <s-banner tone="warning">
        <s-stack justifyContent="center" direction="inline">
          <s-paragraph tone="info">{expiredText}</s-paragraph>
        </s-stack>
      </s-banner>
    )
  }

  return (
    <s-banner tone="info">
      {activeText &&
        <s-stack justifyContent="center" direction="inline" paddingBlockEnd="small">
          <s-paragraph tone="info">{activeText}</s-paragraph>
        </s-stack>
      }
      <s-stack display="auto" justifyContent="center" direction="inline" columnGap="small-500">
        {TIME_MARKER_KEYS.map((marker, index) => (
          <Fragment key={marker}>
            <s-box>
              <TimeMarker
                timeValue={dateValues[index]}
                label={translate(marker)}
              />
            </s-box>
            {index !== TIME_MARKER_KEYS.length - 1 && (
              <s-box>
                <s-text type="strong">:</s-text>
              </s-box>
            )}
          </Fragment>
        ))}
      </s-stack>
    </s-banner>
  );
}

function TimeMarker({ timeValue, label }: TimeMarkerProps) {
  return (
    <s-text type="strong">
      {normalizedTimeMarker(timeValue, label)}
    </s-text>
  );
}
