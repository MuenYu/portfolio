import { Button } from '~/components/button';
import { DecoderText } from '~/components/decoder-text';
import { Divider } from '~/components/divider';
import { Heading } from '~/components/heading';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import { Section } from '~/components/section';
import { Text } from '~/components/text';
import { Transition } from '~/components/transition';
import { Fragment, useState } from 'react';
import type { JSX, RefObject } from 'react';
import { media } from '~/utils/style';
import styles from './profile.module.css';
import config from '~/config.json';

interface ProfileImageConfig {
  placeholder: string;
  normal: string;
  large: string;
}

interface ProfileContentConfig {
  greeting: string;
  paragraphs: string[];
  img: ProfileImageConfig;
}

interface ProfileTextProps {
  visible: boolean;
  titleId: string;
}

interface ProfileProps {
  id: string;
  visible: boolean;
  sectionRef: RefObject<HTMLElement>;
}

const portfolioProfile: ProfileContentConfig = config.profile;

const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/;

const renderTextWithLinks = (text: string): (string | JSX.Element)[] => {
  const nodes: (string | JSX.Element)[] = [];
  const matcher = new RegExp(linkPattern.source, 'g');
  let lastIndex = 0;

  for (const match of text.matchAll(matcher)) {
    const [fullMatch, label, href] = match;
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      nodes.push(text.slice(lastIndex, matchIndex));
    }

    nodes.push(
      <Link key={`${href}-${matchIndex}`} href={href}>
        {label}
      </Link>
    );

    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length ? nodes : [text];
};

const ProfileText = ({ visible, titleId }: ProfileTextProps): JSX.Element => {
  const paragraphs = portfolioProfile.paragraphs.map((paragraph, index) => (
    <Text
      key={index}
      className={styles['description']}
      data-visible={visible}
      size="l"
      as="p"
    >
      {renderTextWithLinks(paragraph)}
    </Text>
  ));
  return (
    <Fragment>
      <Heading className={styles['title']} data-visible={visible} level={3} id={titleId}>
        <DecoderText text={portfolioProfile.greeting} start={visible} delay={500} />
      </Heading>
      {paragraphs}
    </Fragment>
  );
};

export const Profile = ({ id, visible, sectionRef }: ProfileProps): JSX.Element => {
  const [focused, setFocused] = useState(false);
  const titleId = `${id}-title`;

  return (
    <Section
      className={styles['profile']}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      as="section"
      id={id}
      ref={sectionRef}
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <Transition in={visible || focused} timeout={0}>
        {({ visible: isVisible, nodeRef }) => (
          <div className={styles['content']} ref={nodeRef}>
            <div className={styles['column']}>
              <ProfileText visible={isVisible} titleId={titleId} />
              <Button
                secondary
                className={styles['button']}
                data-visible={isVisible}
                href="/contact"
                icon="send"
              >
                Send me a message
              </Button>
            </div>
            <div className={styles['column']}>
              <div className={styles['tag']} aria-hidden>
                <Divider
                  notchWidth="64px"
                  notchHeight="8px"
                  collapsed={!isVisible}
                  collapseDelay={1000}
                />
                <div className={styles['tagText']} data-visible={isVisible}>
                  About me
                </div>
              </div>
              <div className={styles['image']}>
                <Image
                  reveal
                  delay={100}
                  placeholder={portfolioProfile.img.placeholder}
                  srcSet={`${portfolioProfile.img.normal} 480w, ${portfolioProfile.img.large} 960w`}
                  width={960}
                  height={1280}
                  sizes={`(max-width: ${media.mobile}px) 100vw, 480px`}
                  alt="My profile picture"
                />
              </div>
            </div>
          </div>
        )}
      </Transition>
    </Section>
  );
};
