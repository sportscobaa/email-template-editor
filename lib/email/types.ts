export type Align = "left" | "center" | "right";

export interface EmailSettings {
  title: string;
  preheader: string;
  backgroundColor: string;
  contentBackground: string;
  contentWidth: number;
  fontFamily: string;
  textColor: string;
  linkColor: string;
}

/** Spacing and background shared by every block. */
export interface SectionProps {
  paddingY: number;
  paddingX: number;
  /** Empty string means transparent (inherits the content background). */
  backgroundColor: string;
}

export interface HeadingProps extends SectionProps {
  text: string;
  level: "h1" | "h2" | "h3";
  fontSize: number;
  /** Empty string means use the email text color. */
  color: string;
  align: Align;
}

export interface TextProps extends SectionProps {
  text: string;
  fontSize: number;
  lineHeight: number;
  color: string;
  align: Align;
}

export interface ImageProps extends SectionProps {
  src: string;
  alt: string;
  link: string;
  /** Percentage of the available content width (10-100). */
  width: number;
  align: Align;
}

export interface ButtonProps extends SectionProps {
  text: string;
  url: string;
  buttonColor: string;
  textColor: string;
  fontSize: number;
  borderRadius: number;
  fullWidth: boolean;
  align: Align;
}

export interface DividerProps extends SectionProps {
  color: string;
  thickness: number;
}

export interface SpacerProps extends SectionProps {
  height: number;
}

export interface ColumnsProps extends SectionProps {
  leftImage: string;
  leftText: string;
  rightImage: string;
  rightText: string;
  gap: number;
  fontSize: number;
  color: string;
}

export interface SocialProps extends SectionProps {
  facebook: string;
  x: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  website: string;
  pillColor: string;
  pillTextColor: string;
  align: Align;
}

export interface FooterProps extends SectionProps {
  text: string;
  fontSize: number;
  color: string;
  align: Align;
}

export interface HtmlProps extends SectionProps {
  html: string;
}

export interface BlockPropsMap {
  heading: HeadingProps;
  text: TextProps;
  image: ImageProps;
  button: ButtonProps;
  divider: DividerProps;
  spacer: SpacerProps;
  columns: ColumnsProps;
  social: SocialProps;
  footer: FooterProps;
  html: HtmlProps;
}

export type BlockType = keyof BlockPropsMap;

export type Block = {
  [K in BlockType]: { id: string; type: K; props: BlockPropsMap[K] };
}[BlockType];

export interface EmailTemplate {
  settings: EmailSettings;
  blocks: Block[];
}
