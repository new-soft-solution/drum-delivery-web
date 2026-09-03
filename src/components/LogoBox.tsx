import Link from "next/link";
import Image from "next/image";
import logoDark from "@/assets/images/logo-dark.png";
import logoLight from "@/assets/images/logo-light.png";

const LogoBox = () => {
  return (
    <Link href="/" className="logo">
      <span>
        <Image
          width={70}
          height={70}
          src={logoDark}
          alt="logo-large"
          className="logo-lg logo-dark"
        />
        <Image
          width={70}
          height={70}
          src={logoLight}
          alt="logo-large"
          className="logo-lg logo-light"
        />
      </span>
    </Link>
  );
};

export default LogoBox;
