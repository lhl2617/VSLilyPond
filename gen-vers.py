#!/usr/bin/env python3


import os

VERSIONS = [
    "1.6.2",
    "1.6.1",
    "1.6.0",
    "1.5.9",
    "1.5.8",
    "1.5.7",
    "1.5.6",
    "1.5.5",
    "1.5.4",
    "1.5.3",
    "1.5.2",
    "1.5.1",
    "1.5.0",
]

VSLILYPOND_VERSION = "1.7.3"

if __name__ == "__main__":
    for version in VERSIONS:
        print(f"=== PROCESSING {version} ===")
        os.system(f"npm i jzz-midi-smf@{version}")
        os.system(f"npm run package")
        os.system(
            f"mv vslilypond-{VSLILYPOND_VERSION}.vsix vslilypond-jzz-midi-smf@{version}.vsix"
        )
