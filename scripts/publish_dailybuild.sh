if [ $CI == "true" ] && [ $CIRCLE_BRANCH == "master" ]; then
  git config --global user.name "CircleCI";
  git config --global user.email "CircleCI";

  echo "Publishing daily build...";
  cp dist $CIRCLE_ARTIFACTS/ -r;
  cp LICENSE $CIRCLE_ARTIFACTS/;

  git checkout -b daily-build remotes/origin/daily-build;

  rm -rf css;
  rm -rf fonts;
  rm -rf js;
  rm -rf langs;
  rm -rf imgs;
  rm -f index.html;
  rm -f index.manifest;
  rm -f LICENSE;

  cp $CIRCLE_ARTIFACTS/dist/* ./ -r;
  mv $CIRCLE_ARTIFACTS/LICENSE ./;

  git add -A;
  git commit -a -m "daily build #$CIRCLE_SHA1";
  git push origin daily-build;

  echo "Publishing online demo...";
  git checkout -b gh-pages remotes/origin/gh-pages;
  git merge daily-build;
  git push origin gh-pages;

  echo "Done.";
fi
