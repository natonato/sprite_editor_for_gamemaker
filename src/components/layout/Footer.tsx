import React from "react";
import "scss/footer.scss";

const Footer = () => {
  return (
    <div className="footer">
      <a
        href="https://github.com/natonato"
        target="_blank"
        rel="noreferrer"
        className="githubBtn"
      >
        <img
          src={require(`image/github-mark.png`)}
          width="30px"
          height="30px"
          alt=""
        />
        Create By natonato
      </a>
    </div>
  );
};

export default Footer;
