import Link from "next/link";
import Image from "next/image";
import logoDark from "@/assets/images/logo-dark.png";
import logoLight from "@/assets/images/logo-light.png";
import midalLogo from "@/assets/images/midallogo.png";

const LogoBox = () => {
  return (
    <Link href="/" className="logo">
      <span className="d-flex justify-content-center align-items-center flex-wrap">
        <Image
          width={80}

          src={logoDark}
          alt="logo-large"
          className="logo-lg logo-dark"
        />
        <Image
          width={80}

          src={logoLight}
          alt="logo-large"
          className="logo-lg logo-light"
        />
        <Image
          width={120}

          src={midalLogo}
          alt="logo-large"
          className="logo-lg logo-midal"
        />
      </span>
    </Link>
  );
};

export default LogoBox;
