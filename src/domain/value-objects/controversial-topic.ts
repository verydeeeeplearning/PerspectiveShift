import type { StanceDimension } from "./stance-dimension";

export interface ControversialTopicProps {
  id: string;
  title: string;
  description: string;
  dimensions: StanceDimension[];
  tags: string[];
}

export class ControversialTopic {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly dimensions: readonly StanceDimension[];
  readonly tags: readonly string[];

  private constructor(props: ControversialTopicProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.dimensions = Object.freeze([...props.dimensions]);
    this.tags = Object.freeze([...props.tags]);
  }

  static create(props: ControversialTopicProps): ControversialTopic {
    if (!props.id.trim()) {
      throw new Error("Topic id must not be empty");
    }
    if (!props.title.trim()) {
      throw new Error("Topic title must not be empty");
    }
    if (props.dimensions.length === 0) {
      throw new Error("Topic must have at least one dimension");
    }
    return new ControversialTopic(props);
  }

  equals(other: ControversialTopic): boolean {
    return this.id === other.id;
  }
}
