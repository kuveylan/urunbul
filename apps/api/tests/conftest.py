import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))
PACKAGES_DIR = os.path.join(ROOT_DIR, "packages")

if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if PACKAGES_DIR not in sys.path:
    sys.path.insert(0, PACKAGES_DIR)
