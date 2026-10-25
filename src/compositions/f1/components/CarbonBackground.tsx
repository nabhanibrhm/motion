import { Ground, GroundProps } from "./toon/Ground";

type Props = GroundProps & { /** Legacy props, ignored by the flat look. */ accent?: string; intensity?: number };

// Kept for the old export name: renders the calm editorial ground (#EEEEEE by default).
export const CarbonBackground: React.FC<Props> = ({ accent: _accent, intensity: _intensity, ...ground }) => <Ground {...ground} />;
