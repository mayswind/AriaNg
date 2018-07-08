if [ $CI == "true" ] && [ $CIRCLE_BRANCH == "master" ]; then
  git config --global user.name "CircleCI";
  git config --global user.email "CircleCI";

  echo "Publishing daily build...";
  git clone https://github.com/mayswind/AriaNg-DailyBuild.git $ARIANG_WORKING_DIR/AriaNg-DailyBuild/

  rm -rf $ARIANG_WORKING_DIR/AriaNg-DailyBuild/*
  cp dist/* $ARIANG_WORKING_DIR/AriaNg-DailyBuild/ -r;

  cd $ARIANG_WORKING_DIR/AriaNg-DailyBuild/;

  git add -A;
  git commit -a -m "daily build #$CIRCLE_SHA1";
  git push origin master;

  echo "Done.";
fi
